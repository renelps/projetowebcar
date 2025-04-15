import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelHeader";
import { FiUpload } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input/index";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiTrash } from "react-icons/fi"
import { ChangeEvent, useContext, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import { v4 as uuidV4} from "uuid";
import { storage, db  } from "../../../services/firebase/firebaseConnection";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
 } from "firebase/storage"
import { addDoc, collection} from "firebase/firestore"

const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatório"),
  model: z.string().nonempty("O campo modelo é obrigatório"),
  year: z.string().nonempty("O campo Ano é obrigatório"),
  km: z.string().nonempty("O campo Km é obrigatório"),
  price: z.string().nonempty("O campo preço é obrigatório"),
  city: z.string().nonempty("O campo cidade é obrigatório"),
  whatsapp: z.string().min(1, "O campo whatsapp é obrigatório").refine((value) => /^(\d{11,12})$/.test(value), {
    message: "Número de telefone inválido."
  }),
  description: z.string().nonempty("O campo descrição é obrigatório")
})

type FormData = z.infer<typeof schema>

interface ImageItemProps {
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export function New() {
  const [carImages, setCarImages] = useState<ImageItemProps[]>([])
  const { user } = useContext(AuthContext)
  const { register, handleSubmit, formState: { errors }, reset} = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })


  function onSubmit(data: FormData) {
    if(carImages.length === 0) {
      alert("Envie alguma imagem do seu carro")
      return;
    }

    const carListImage = carImages.map((item) => {
      return {
        uid: item.name,
        name: item.uid,
        url: item.url
      }
    })

    addDoc(collection(db, "cars"), {
      name: data.name,
      model: data.model,
      city: data.city,
      whatsapp: data.whatsapp,
      price: data.price,
      year: data.year,
      km: data.km,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImage
    }).then(() => {
      reset()
      setCarImages([])
    }).catch((err) => {
      console.log(err)
    })
  }

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    if(event.target.files && event.target.files[0]) {
      const image = event.target.files[0]


      if(image.type === "image/jpeg" || image.type === "image/png") {
        await handleUpload(image)
      }else {
        alert("A imagem só pode ser jpeg ou png")
      }
    }
  }

  function handleUpload(image: File) {
    if(!user?.uid) {
      return;
    }

    const currentUuid = user?.uid;
    const uidImage = uuidV4()

    const uploadRef = ref(storage, `images/${currentUuid}/${uidImage}`)

    uploadBytes(uploadRef, image)
    .then((snoopshot) => {
      getDownloadURL(snoopshot.ref).then((downloadUrl) => {
        
        const imageItem = {
          name: uidImage,
          uid: currentUuid,
          previewUrl: URL.createObjectURL(image),
          url: downloadUrl,
        }

        setCarImages((images) => [...images, imageItem])



      })
    }).catch((error) => {
      console.log("Error ao enviar a imagem", error)
    })
  }

  async function handleDeleteImage(item: ImageItemProps) {
    const imagePath = `images/${item.uid}/${item.name}`

    const imageRef = ref(storage, imagePath)

    try {
      await deleteObject(imageRef)
      setCarImages(carImages.filter((image) => image.url !== item.url))
    }catch(err) {
      console.log("Erro ao deletar a imagem", err)
    }
  }

  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded-md flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-md flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000"/>
          </div>
          <div className="cursor-pointer">
            <input className="opacity-0 cursor-pointer" type="file" accept="image/*" onChange={handleImage} />
          </div>
        </button>

        {carImages.map((item) => (
          <div key={item.name} className="w-full h-32 flex items-center justify-center relativa">
            <button className="absolute" onClick={() => handleDeleteImage(item)}>
              <FiTrash size={28} color="#000"/>
            </button>
            <img 
              src={item.previewUrl} 
              alt={"foto do carro"} 
              className="w-full rounded-md h-32 object-cover"
            />

          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-md flex flex-col sm-flex-row gap-2 mt-2">
         <form
          className="w-full"
          onSubmit={handleSubmit(onSubmit)}
         >

          <div className="mb-2">
            <p className="mb-2 font-medium">Nome do carro</p>
            <Input 
              placeholder="Ex: SW4 2.8..."
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
            />
          </div>

          <div className="mb-2">
            <p className="mb-2 font-medium">Modelo do carro</p>
            <Input 
              placeholder="Ex: 2.0 diesel automático..."
              type="text"
              register={register}
              name="model"
              error={errors.model?.message}
            />
          </div>

          <div className="flex flex-row gap-3 items-center w-full">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano do carro</p>
              <Input 
                placeholder="Ex: 2025/2025..."
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
              />
            </div>

            <div className="w-full">
                <p className="mb-2 font-medium">Km do carro</p>
                <Input 
                  placeholder="Ex: 188.000km"
                  type="text"
                  register={register}
                  name="km"
                  error={errors.km?.message}
                />
            </div>
          </div>

          <div className="w-full mb-2">
            <p className="mb-2 font-medium">Preço do carro</p>
            <Input 
              placeholder="Ex: R$222.000..."
              type="text"
              register={register}
              name="price"
              error={errors.price?.message}
            />
          </div>

          <div className="w-full mb-2">
            <p className="mb-2 font-medium">Cidade onde o carro se localiza</p>
            <Input 
              placeholder="Ex: Pesqueira PE..."
              type="text"
              register={register}
              name="city"
              error={errors.city?.message}
            />
          </div>

          <div className="w-1/2 mb-2">
            <p className="mb-2 font-medium">Número do whatsapp</p>
            <Input 
              placeholder="Ex: (**) **** ****..."
              type="text"
              register={register}
              name="whatsapp"
              error={errors.whatsapp?.message}
            />
          </div>

          <div className="w-full mb-2">
            <p className="mb-2 font-medium">Descrição do carro</p>
            <textarea 
              className="border-2 w-full rounded-md h-25 px-2 border-slate-200"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Ex: O carro tem..."
            />
            {errors.description && <p className="text-red-500">{errors.description?.message}</p>}
          </div>

          <button 
            type="submit"
            className="flex items-center justify-center w-full bg-zinc-900 text-white py-1 rounded-md cursor-pointer"
          >
            Cadastrar
          </button>
         </form>
      </div>
    </Container>
  )
}