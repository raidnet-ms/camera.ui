/* eslint-disable unicorn/prevent-abbreviations */
'use-strict';

import crypto from 'crypto';

import ConfigService from '../../services/config/config.service.js';

import * as UserModel from '../components/users/users.model.js';

const validPermissions = ConfigService.interface.permissionLevels;

export const hasAuthValidFields = (req, res, next) => {
  let errors = [];

  if (req.body) {
    if (!req.body.username) {
      errors.push('Missing username field');
    }

    if (!req.body.password) {
      errors.push('Missing password field');
    }

    return errors.length > 0
      ? res.status(422).send({
          statusCode: 422,
          message: errors.join(','),
        })
      : next();
  } else {
    return res.status(400).send({
      statusCode: 400,
      message: 'Bad request',
    });
  }
};

export const hasValidFields = (req, res, next) => {
  let errors = [];

  if (req.body) {
    if (!req.body.username) {
      errors.push('Missing username field');
    }

    if (!req.body.password) {
      errors.push('Missing password field');
    }

    if (req.body.permissionLevel && !req.body.permissionLevel.some((level) => validPermissions.includes(level))) {
      errors.push('Permission level is not valid');
    }

    return errors.length > 0
      ? res.status(422).send({
          statusCode: 422,
          message: errors.join(','),
        })
      : next();
  } else {
    return res.status(400).send({
      statusCode: 400,
      message: 'Bad request',
    });
  }
};

export const isPasswordAndUserMatch = async (req, res, next) => {
  const user = await UserModel.findByName(req.body.username);

  if (!user) {
    res.status(403).send({
      statusCode: 403,
      message: 'Forbidden',
    });
  } else if (!user?.password) {
    res.status(403).send({
      statusCode: 403,
      message: 'Password missing',
    });
  } else {
    let passwordFields = user.password.split('$');
    let salt = passwordFields[0];
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest('base64');

    if (hash === passwordFields[1]) {
      req.body = {
        id: user.id,
        username: user.username,
        sessionTimer: user.sessionTimer,
        permissionLevel: user.permissionLevel,
        photo: user.photo,
      };

      return next();
    } else {
      return res.status(401).send({
        statusCode: 401,
        message: 'Invalid username or password',
      });
    }
  }
};
