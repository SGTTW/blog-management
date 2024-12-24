import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        setPosts(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Blog Posts</h1>
      <div className="space-y-8">
        {posts.map(post => (
          <article key={post.id} className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
            <p className="text-gray-600 mb-4">
              {new Date(post.timestamp).toLocaleDateString()}
            </p>
            <div className="prose text-gray-700">{post.content}</div>
          </article>
        ))}
        {posts.length === 0 && (
          <p className="text-center text-gray-600">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
