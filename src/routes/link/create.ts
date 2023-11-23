import { body } from "express-validator";
import express from "express";

import { link_model } from "../../models";

import { require_auth, validate_request } from "common/middlewares";

const router = express.Router();
import { Link } from "types-vollab/dist/shared/link";

router.post(
  "/api/users/links",
  require_auth(["candidate", "orderer"]),
  body("href", "href must not be empty").notEmpty(),
  body("label", "label must not be empty").notEmpty(),
  validate_request,
  async (req, res) => {
    const user_id = req.current_user!.user_id;
    const { href, label }: Link = req.body;

    const [link] = await link_model.insert({ user_id, url: href, text: label });

    res.status(201).json({ link });
  }
);

export { router as link_create_router };
