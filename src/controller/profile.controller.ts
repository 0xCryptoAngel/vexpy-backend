import { profileItem } from "../db/schema/profileItem";
import { I_PROFILE } from "../types/interfaces";
export const updateProfile = async (_address: string, payload: I_PROFILE) => {
  const _profile = await profileItem.findOne({ address: _address });
  if (_profile) {
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
  } else {
    const profile = await profileItem.create({ address: _address });
    profile.name = _address.slice(-10);
    profile.bio = payload.bio;
    profile.email = payload.email;
    profile.website = payload.website;
    profile.twitter = payload.twitter;
    profile.instagram = payload.instagram;
    profile.avatarImage = payload.avatarImage;
    profile.coverImage = payload.coverImage;
    profile.save();
    return profile;
  }
};

export const fetchProfile = async (_address: string) => {
  const _profile = await profileItem.findOne({ address: _address });
  return _profile;
};
