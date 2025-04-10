import {
    addDoc,
    getDocs,
    collection,
    query,
    where,
    deleteDoc,
    doc,
  } from "firebase/firestore";
  import { useEffect, useState } from "react";
  import { useAuthState } from "react-firebase-hooks/auth";
  import { db, auth } from "../../config/firebase";
  import { PostType as IPost } from "./main";
  import "../../App.css"
  import { Lightbulb } from "lucide-react";
  import { Link } from "react-router-dom";


  
  interface Props {
    post: IPost;
  }
  
  interface Like {
    likeId: string;
    userId: string;
  }
  
  export const Post = ({ post }: Props) => {
    const [user] = useAuthState(auth);
    const [likes, setLikes] = useState<Like[]>([]);
    const [animateLike, setAnimateLike] = useState(false);
  
    const likesRef = collection(db, "likes");
  
    const getLikes = async () => {
      const data = await getDocs(query(likesRef, where("postId", "==", post.id)));
      const likesData = data.docs.map((doc) => ({
        userId: doc.data().userId,
        likeId: doc.id,
      }));
      setLikes(likesData);
    };
  
    const addLike = async () => {
      if (!user) return;
      try {
        const newDoc = await addDoc(likesRef, {
          userId: user.uid,
          postId: post.id,
        });
        setLikes((prev) => [...prev, { userId: user.uid, likeId: newDoc.id }]);
        setAnimateLike(true);
      } catch (err) {
        console.log("Add like error:", err);
      }
    };
  
    const removeLike = async () => {
      if (!user) return;
      try {
        const likeToDeleteQuery = query(
          likesRef,
          where("postId", "==", post.id),
          where("userId", "==", user.uid)
        );
        const likeToDeleteData = await getDocs(likeToDeleteQuery);
  
        if (!likeToDeleteData.empty) {
          const likeId = likeToDeleteData.docs[0].id;
          await deleteDoc(doc(db, "likes", likeId));
          setLikes((prev) => prev.filter((like) => like.likeId !== likeId));
          setAnimateLike(true);
        }
      } catch (err) {
        console.log("Remove like error:", err);
      }
    };
  
    const hasUserLiked = likes.some((like) => like.userId === user?.uid);
  
    const handleLikeToggle = () => {
      hasUserLiked ? removeLike() : addLike();
    };
  
    useEffect(() => {
      getLikes();
    }, []);
  
    useEffect(() => {
      if (animateLike) {
        const timer = setTimeout(() => setAnimateLike(false), 300);
        return () => clearTimeout(timer);
      }
    }, [animateLike]);
  
    return (
      <div className="post-container bg-[#1a102f] rounded-xl shadow-lg p-5 space-y-3 border border-[#3c1a5b] text-white">
  {/* Profile section */}
  <div className="flex items-center gap-3">
    <img
      src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${post.userId}`}
      alt={post.usernamee}
      className="w-10 h-10 rounded-full object-cover border border-violet-600"
    />
    <span className="text-sm font-medium text-violet-300 hover:underline hover:cursor-pointer">
    <Link to={`/profile/${post.userId}`} className="text-sm font-medium text-violet-300 hover:underline hover:cursor-pointer">
  {post.usernamee}
</Link>

    </span>
  </div>

  {/* Title */}
  <h2 className="text-lg sm:text-xl font-semibold text-white break-words">
    {post.title}
  </h2>

  {/* Description */}
  <p className="text-violet-200 text-sm sm:text-base break-words">
    {post.description}
  </p>

  {/* Like Button */}
  <div className="footer flex items-center gap-2">
    <button
      onClick={handleLikeToggle}
      className={`text-sm font-medium hover:cursor-pointer flex items-center gap-1 ${
        hasUserLiked ? "text-yellow-400" : "text-violet-300"
      } ${animateLike ? "like-animate" : ""}`}
    >
      <Lightbulb
        className={`w-5 h-5 transition-colors duration-300 ${
          hasUserLiked ? "fill-yellow-400" : "fill-transparent stroke-violet-500"
        }`}
      />
      <span className="text-violet-200">Idea</span>
    </button>
    <span className="text-sm text-violet-400">{likes.length}</span>
  </div>
</div>

    );
  };
  
  export default Post;
  