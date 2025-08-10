import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";

import { toast } from "sonner";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { db } from "./firebase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// custom CSS paragraphs
const markdownStyles = {
  p: {
    marginBottom: "1em",
    lineHeight: "1.6",
    whitespace: "pre-line",
  },
};

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      setPosts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // handle votes
  // const handleVote = async (postId, type) => {

  //   try {
  //     const postRef = doc(db, "posts", postId);
  //     await updateDoc(postRef, {
  //       [type]: increment(1),
  //     });

  //     setPosts(
  //       posts.map((post) =>
  //         post.id === postId ? { ...post, [type]: (post[type] || 0) + 1 } : post
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Error updating vote:", error);
  //   }
  // };

  // src/components/Blog.js
  const handleVote = async (postId, type) => {
    // Get user's votes from localStorage
    const userVotes = JSON.parse(localStorage.getItem("userVotes")) || {};

    // Check if the user already voted the same way
    if (userVotes[postId] === type) {
      // Undo the vote (return to initial state)
      await updateDoc(doc(db, "posts", postId), {
        [type]: increment(-1), // Subtract 1
      });
      delete userVotes[postId]; // Remove the vote record

      toast.success("Vote removed successfully!", {
        duration: 5000,
      });
    } else {
      // Remove previous vote (if any)
      if (userVotes[postId]) {
        await updateDoc(doc(db, "posts", postId), {
          [userVotes[postId]]: increment(-1), // Subtract previous vote
        });

        await updateDoc(doc(db, "posts", postId), { [type]: increment(1) });
        userVotes[postId] = type;
        toast.success(
          `You ${type === "likes" ? "liked" : "disliked"} this post!`
        );
      }

      // Add new vote
      await updateDoc(doc(db, "posts", postId), {
        [type]: increment(1), // Add 1
      });
      userVotes[postId] = type; // Store the new vote
    }

    // Update localStorage and refresh UI
    localStorage.setItem("userVotes", JSON.stringify(userVotes));
    fetchPosts(); // Re-fetch to update counts
  };

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
        {posts.map((post) => {
          const userVotes = JSON.parse(localStorage.getItem("userVotes")) || {};
          return (
            <article
              key={post.id}
              className="border rounded-lg p-6 bg-white shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
              <p className="text-gray-600 mb-4">
                {new Date(post.timestamp).toLocaleDateString("en-GB")}
              </p>

              {post.imageUrl && (
                <div className="mb-4">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="max-w-full h-auto rounded"
                  />
                </div>
              )}

              <div className="prose max-w-none" style={markdownStyles}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p
                        {...props}
                        style={{
                          marginBottom: "1.5rem",
                          lineHeight: "1.6",
                        }}
                      />
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* <button
                onClick={() => {
                  localStorage.removeItem("userVotes");
                  toast.success("All votes cleared!");
                  fetchPosts();  
                }}
                className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded"
              >
                Clear My Votes (Testing)
              </button> */}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote(post.id, "likes")}
                    className={`flex items-center space-x-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors ${
                      userVotes[post.id] === "likes"
                        ? "bg-green-100"
                        : "text-gray-500 hover:text-green-600"
                    }`}
                  >
                    <span className="mr-1">
                      {" "}
                      <ThumbsUp size={18} />
                    </span>{" "}
                    {post.likes || 0}
                  </button>
                  <button
                    onClick={() => handleVote(post.id, "dislikes")}
                    className={`flex items-center space-x-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors ${
                      userVotes[post.id] === "dislikes"
                        ? "bg-red-100"
                        : "text-gray-500 hover:text-red-600"
                    }`}
                  >
                    <span className="mr-1">
                      {" "}
                      <ThumbsDown size={18} />
                    </span>{" "}
                    {post.dislikes || 0}
                  </button>
                </div>

                {/* adding post voteup and votesdown as like total interactions */}
                <div className="text-sm text-gray-500">
                  {post.likes + post.dislikes || 0} interactions
                </div>
              </div>
              {/* <div className="prose text-gray-700">{post.content}</div> */}
            </article>
          );
        })}
        {posts.length === 0 && (
          <p className="text-center text-gray-600">No posts yet.</p>
        )}
      </div>
    </div>
  );
}

// -----------------------
// ---

// import { useState, useEffect } from 'react';
// import { collection, getDocs, query, orderBy } from 'firebase/firestore';
// import { db } from './firebase';

// export default function Blog() {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
//         const snapshot = await getDocs(q);
//         setPosts(snapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         })));
//       } catch (error) {
//         console.error("Error fetching posts:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPosts();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h1 className="text-4xl font-bold text-center mb-8">Blog Posts</h1>
//       <div className="space-y-8">
//         {posts.map(post => (
//           <article key={post.id} className="border rounded-lg p-6 shadow-sm">
//             <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
//             <p className="text-gray-600 mb-4">
//               {new Date(post.timestamp).toLocaleDateString()}
//             </p>
//             <div className="prose text-gray-700">{post.content}</div>
//           </article>
//         ))}
//         {posts.length === 0 && (
//           <p className="text-center text-gray-600">No posts yet.</p>
//         )}
//       </div>
//     </div>
//   );
// }
