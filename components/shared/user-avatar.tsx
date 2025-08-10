"use client";

import Avatar from "boring-avatars";

interface Props {
  userId: string;
  size: number;
}

const UserAvatar = ({ userId, size }: Props) => {
  return (
    <Avatar
      size={size}
      name={userId}
      variant="ring"
      colors={["#00040f", "#ff57d8", "#00f6ff", "#BD0090", "#5f5af6"]}
    />
  );
};

export default UserAvatar;
