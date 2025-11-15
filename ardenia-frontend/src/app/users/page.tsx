'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  username: string;
  display_name: string;
};

export default function UserPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/first`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: User = await res.json();
        console.log('Fetched user:', data); // <-- log the user
        setUser(data);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      {user.map((user: User) => (
        <div key={user.id}>
          <p>{user.username}</p>
        </div>
      ))}
    </div>
  );
}
