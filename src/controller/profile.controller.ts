import { profileItem } from "../db/schema/profileItem";
import { I_PROFILE } from "../types/interfaces";
import { transporter } from "../utils/smtp";
const Identicon = require("identicon.js");

export const updateProfile = async (_address: string, payload: I_PROFILE) => {
  console.log("asdasdasda", payload);
  const _profile = await profileItem.findOne({ address: _address });
  if (!_profile) return;
  console.log("esdsd");
  _profile.name = payload.name;
  _profile.bio = payload.bio;
  _profile.email = payload.email;
  _profile.website = payload.website;
  _profile.twitter = payload.twitter;
  _profile.instagram = payload.instagram;
  _profile.avatarImage = payload.avatarImage;
  _profile.coverImage = payload.coverImage;
  _profile.save();
  return _profile;
};

export const fetchProfile = async (_address: string) => {
  const _profile = await profileItem.findOne({ address: _address });
  if (_profile) {
    return _profile;
  } else {
    const profile = await profileItem.create({ address: _address });
    profile.avatarImage = `data:image/svg+xml;base64,${new Identicon(_address, {
      size: 420, // 420px square
      format: "svg", // use SVG instead of PNG
    }).toString()}`;
    profile.save();
    return profile;
  }
};

export const fetchUser = async (_name: string) => {
  console.log("_name", _name);
  const _profile = await profileItem.findOne({ name: _name });
  if (_profile) return true;
  else return false;
};

export const allUsers = async () => {
  const _profile = await profileItem.find({});
  return _profile;
};

export const sendVerification = async (email: string, address: string) => {
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;
  const _profile = await profileItem.findOne({ address: address });
  if (!_profile) return;
  _profile.code = randomNumber;
  _profile.save();

  let mailOptions = {
    from: process.env.EMAIL_FROM, // sender address
    to: email, // list of receivers
    subject: "Verify your email for Vexpy", // Subject line
    text: "Hello. Follow this link to verify your email address. If you didn’t ask to verify this address, you can ignore this email. Thanks, Vexpy team.", // plain text body
    html: `<div>
            <div>Hello.</div>
            <br />
            <div>${randomNumber}</div>
            <div>Vexpy team.</div>
          </div>`, // html body
  };
  console.log("mailOptions", mailOptions);
  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);
  return { value: "ok" };
};
