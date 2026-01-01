import React from "react";
import { SERVER_BASE_URL } from "../api/api"

const getAvatarSrc = (user, preview) => {
  if (preview) return preview;

  if (user?.profilePicture) {
    const base = SERVER_BASE_URL.replace(/\/$/, "");
    const path = user.profilePicture.replace(/^\//, "");
    return `${base}/${path}`;
  }

  const name = user?.fullName || "U";
  return `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff&size=128`;
};

export const Avatar = ({ user, preview = null, size = 48, className = "" }) => {
  const src = getAvatarSrc(user, preview);
  const [imgSrc, setImgSrc] = React.useState(src);

  React.useEffect(() => {
    setImgSrc(getAvatarSrc(user, preview));
  }, [user, preview]);

  return (
    <img
      src={imgSrc}
      alt="User Avatar"
      className={`rounded-full object-cover border border-gray-300 ${className}`}
      style={{ width: size, height: size }}
      onError={() =>
        setImgSrc(
          `https://ui-avatars.com/api/?name=${user?.fullName || "U"}&background=0D8ABC&color=fff&size=128`
        )
      }
    />
  );
};
export default Avatar;

