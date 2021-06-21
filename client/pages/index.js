import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const index = () => {
  const [user, setUser] = useState(null);
  useEffect(async () => {
    // const data = await axios.get('http://localhost:4000/auth/me').then((res) => JSON.parse(res.data));
    // console.log(data);
  }, []);
  return (
    <div>
      <Link href='/login'>Login</Link>
    </div>
  );
};

export default index;
