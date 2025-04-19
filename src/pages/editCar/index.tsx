import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelHeader";
import { FiUpload, FiTrash } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { Input } from "../../components/input/index";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { v4 as uuidV4 } from "uuid";
import { storage, db } from "../../services/firebase/firebaseConnection";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatório"),
  model: z.string().nonempty("O campo modelo é obrigatório"),
  year: z.string().nonempty("O campo Ano é obrigatório"),
  km: z.string().nonempty("O campo Km é obrigatório"),
  price: z.string().nonempty("O campo preço é obrigatório"),
  city: z.string().nonempty("O campo cidade é obrigatório"),
  whatsapp: z
    .string()
    .min(1, "O campo whatsapp é obrigatório")
    .refine((value) => /^(\d{11,12})$/.test(value), {
      message: "Número de telefone inválido.",
    }),
  description: z.string().nonempty("O campo descrição é obrigatório"),
});

type FormData = z.infer<typeof schema>;

interface ImageItemProps {
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export function EditCar() {
  const [carImages, setCarImages] = useState<ImageItemProps[]>([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    async function loadCar() {
      if (!id) return;
      const docRef = doc(db, "cars", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const car = docSnap.data();
        setValue("name", car.name);
        setValue("model", car.model);
        setValue("year", car.year);
        setValue("km", car.km);
        setValue("price", car.price);
        setValue("city", car.city);
        setValue("whatsapp", car.whatsapp);
        setValue("description", car.description);
        setCarImages(car.images || []);
      }
    }

    loadCar();
  }, [id, setValue]);

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const image = event.target.files[0];

      if (image.type === "image/jpeg" || image.type === "image/png") {
        await handleUpload(image);
      } else {
        alert("A imagem só pode ser jpeg ou png");
      }
    }
  }

  async function handleUpload(image: File) {
    if (!user?.uid) return;

    const currentUuid = user?.uid;
    const timestamp = new Date().getTime();
    const uidImage = `${uuidV4()}-${timestamp}`;
    const uploadRef = ref(storage, `images/${currentUuid}/${uidImage}`);

    try {
      const snapshot = await uploadBytes(uploadRef, image);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      const imageItem = {
        name: uidImage,
        uid: currentUuid,
        previewUrl: URL.createObjectURL(image),
        url: downloadUrl,
      };

      setCarImages((images) => [...images, imageItem]);
    } catch (error) {
      console.log("Erro ao enviar imagem:", error);
    }
  }

  async function handleDeleteImage(item: ImageItemProps) {
    const imagePath = `images/${item.uid}/${item.name}`;
    const imageRef = ref(storage, imagePath);

    try {
      await deleteObject(imageRef);

      if (!id) return;
      const docRef = doc(db, "cars", id);
      const docSnap = await getDoc(docRef);
      const carData = docSnap.data();

      if (carData && carData.images) {
        const updatedImages = carData.images.filter(
          (image: { url: string }) => image.url !== item.url
        );

        await updateDoc(docRef, { images: updatedImages });

        setCarImages((prevState) => prevState.filter((image) => image.url !== item.url));

        toast.success("Imagem excluída com sucesso!");
      }
    } catch (err) {
      console.log("Erro ao deletar imagem", err);
      toast.error("Erro ao deletar imagem");
    }
  }

  async function onSubmit(data: FormData) {
    if (!id) return;

    if (carImages.length === 0) {
      toast.error("Adicione pelo menos uma imagem");
      return;
    }

    const carListImage = carImages.map((item) => ({
      uid: item.uid,
      name: item.name,
      url: item.url,
    }));

    const docRef = doc(db, "cars", id);

    try {
      await updateDoc(docRef, {
        name: data.name.toUpperCase(),
        model: data.model,
        city: data.city,
        whatsapp: data.whatsapp,
        price: data.price,
        year: data.year,
        km: data.km,
        description: data.description,
        images: carListImage,
      });

      toast.success("Carro atualizado com sucesso!");
      navigate("/dashboard")
    } catch (err) {
      console.log(err);
      toast.error("Erro ao atualizar carro");
    }
  }

  return (
    <Container>
      <DashboardHeader />
      <p>Adicione pelo menos 3 imagens do seu carro...</p>

      <div className="w-full bg-white p-3 rounded-md flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-md flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input
              className="opacity-0 cursor-pointer"
              type="file"
              accept="image/*"
              onChange={handleImage}
            />
          </div>
        </button>

        {carImages.map((item) => (
          <div
            key={item.name}
            className="w-full h-32 flex items-center justify-center relative"
          >
            <button
              className="absolute"
              onClick={() => handleDeleteImage(item)}
            >
              <FiTrash size={28} color="#000" />
            </button>
            <img
              src={item.previewUrl ?? item.url}
              alt="foto do carro"
              className="w-full rounded-md h-32 object-cover"
            />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-md flex flex-col gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
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
              placeholder="Ex: O carro tem..."
            />
            {errors.description && (
              <p className="text-red-500">{errors.description?.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center justify-center w-full bg-zinc-900 text-white py-1 rounded-md cursor-pointer"
          >
            Salvar alterações
          </button>
        </form>
      </div>
    </Container>
  );
}
