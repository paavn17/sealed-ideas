import { yupResolver } from "@hookform/resolvers/yup"
import {useForm} from "react-hook-form"
import * as yup  from "yup"
import {addDoc, collection} from "firebase/firestore"
import {auth, db} from "../../config/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router-dom"

const Form = () => {

    const [user] = useAuthState(auth)
    const navigate = useNavigate()

    const schema = yup.object().shape({
        title: yup.string().required("You must add a titlee"),
        description: yup.string().required("You must add description"),
    })

    const {register, handleSubmit, formState:{errors} } = useForm({
        resolver : yupResolver(schema)
    })

    const postsRef = collection(db,"posts")

    const onCreatePost = async (data: any) => {
        try {
          await addDoc(postsRef, {
            title: data.title,
            description: data.description,
            usernamee: user?.displayName || user?.email,
            userId: user?.uid,
          });
          console.log("Post added successfully");
          navigate("/");
        } catch (error) {
          console.error("Error adding post:", error);
        }
      };
      

  return (

<form
  onSubmit={handleSubmit(onCreatePost)}
  className="w-full max-w-md bg-[#1A102F] shadow-lg rounded-xl p-6 space-y-5 
             mx-auto mt-10 sm:mt-16 md:mt-24 lg:mt-32 text-white"
>
  <div>
    <input
      placeholder="Title..."
      {...register("title")}
      className="w-full px-4 py-2 bg-[#2A1C44] border border-[#4B3B71] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-400"
    />
    {errors.title && (
      <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
    )}
  </div>

  <div>
    <textarea
      placeholder="Description"
      {...register("description")}
      rows={4}
      className="w-full px-4 py-2 bg-[#2A1C44] border border-[#4B3B71] text-white rounded-lg resize-none max-h-40 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-400"
    />
    {errors.description && (
      <p className="text-red-400 text-sm mt-1">
        {errors.description.message}
      </p>
    )}
  </div>

  <button
    type="submit"
    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
  >
    Submit
  </button>
</form>


  )
}

export default Form