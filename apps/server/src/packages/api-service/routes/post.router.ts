// deps
import { Router } from 'express';
import { Joi, Segments, celebrate } from 'celebrate';
import { Container } from 'typedi';

// local deps
import { PostgresService } from '../../postgres-service';
import {
  PostgresDateSortOperators,
  UUID_V5_LENGTH,
} from '../../postgres-service/lib/constants';

export function getPostRouter() {
  return Router({
    mergeParams: true,
  })
    .post(
      '/',
      celebrate({
        [Segments.BODY]: Joi.object({
          title: Joi.string().required(),
          content: Joi.string().required(),
          category: Joi.string().required(),
          assetId: Joi.string().required(),
        }).required(),
      }),
      async (req, res, next) => {
        const { title, content, category, assetId } = req.body;
        try {
          const postgresService = Container.get(PostgresService);
          const { Post } = postgresService.getModels();
          const postData = Post.fromJsonPost(title, content, category, assetId);
          const post = await Post.query().insertAndFetch(postData);
          return res.status(200).json({
            msg: 'OK',
            id: post.id,
          });
        } catch (err) {
          if (err instanceof Error) {
            if (err.name === 'ForeignKeyViolationError') {
              return next(
                new Error(`Asset with id "${assetId}" does not exist`),
              );
            }
          }
          return next(err);
        }
      },
    )
    .get(
      '/',
      celebrate({
        [Segments.QUERY]: Joi.object({
          category: Joi.string().optional(),
          sort: Joi.string()
            .optional()
            .valid(...Object.values(PostgresDateSortOperators)),
        }),
      }),
      async (req, res, next) => {
        try {
          const postgresService = Container.get(PostgresService);
          const { Post } = postgresService.getModels();
          const builder = Post.query();
          const { category, sort } = req.query;
          if (category) {
            builder.where(
              `${Post.tableName}.category`,
              '=',
              category as string,
            );
          }
          if (sort) {
            builder.orderBy(
              `${Post.tableName}.createdAt`,
              sort as PostgresDateSortOperators,
            );
          }
          const posts = await builder;
          return res.status(200).json(posts);
        } catch (err) {
          console.error(err);
          return next(err);
        }
      },
    )
    .get(
      '/:postId',
      celebrate({
        [Segments.PARAMS]: Joi.object({
          postId: Joi.string().required().length(UUID_V5_LENGTH),
        }).required(),
      }),
      async (req, res, next) => {
        try {
          const postgresService = Container.get(PostgresService);
          const { Post } = postgresService.getModels();
          const post = await Post.query().findById(req.params.postId);
          if (!post) {
            return res.status(404).json({
              msg: 'Not found',
            });
          }
          return res.status(200).json(post);
        } catch (err) {
          console.error(err);
          return next(err);
        }
      },
    )
    .put(
      '/:postId',
      celebrate({
        [Segments.PARAMS]: Joi.object({
          postId: Joi.string().required().length(UUID_V5_LENGTH),
        }).required(),
        [Segments.BODY]: Joi.object({
          title: Joi.string(),
          content: Joi.string(),
          category: Joi.string(),
          assetId: Joi.string(),
        })
          .required()
          .min(1),
      }),
      async (req, res, next) => {
        const { assetId } = req.body;
        try {
          const postgresService = Container.get(PostgresService);
          const { Post } = postgresService.getModels();
          const post = await Post.query().patchAndFetchById(
            req.params.postId,
            req.body,
          );
          if (!post) {
            return res.status(404).json({
              msg: `Post with id ${req.params.postId} not found`,
            });
          }
          return res.status(200).json({
            msg: 'OK',
          });
        } catch (err) {
          if (err instanceof Error) {
            if (err.name === 'ForeignKeyViolationError') {
              return next(
                new Error(`Asset with id "${assetId}" does not exist`),
              );
            }
          }
          return next(err);
        }
      },
    )
    .delete(
      '/:postId',
      celebrate({
        [Segments.PARAMS]: Joi.object({
          postId: Joi.string().required().length(UUID_V5_LENGTH),
        }).required(),
      }),
      async (req, res, next) => {
        try {
          const postgresService = Container.get(PostgresService);
          const { Post } = postgresService.getModels();
          const post = await Post.query().deleteById(req.params.postId);
          if (!post) {
            return res.status(404).json({
              msg: 'Not found',
            });
          }
          return res.status(200).json({
            msg: 'OK',
            id: req.params.postId,
          });
        } catch (err) {
          return next(err);
        }
      },
    );
}
