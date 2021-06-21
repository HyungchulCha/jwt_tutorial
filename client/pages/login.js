import React from 'react';

const login = () => {
  return (
    <div>
      <a href='http://localhost:4000/auth/google/login'>Google Login</a>
      <a href='http://localhost:4000/auth/kakao/login'>Kakao Login</a>
    </div>
  );
};

export default login;
