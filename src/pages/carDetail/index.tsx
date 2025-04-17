import { useEffect, useState } from "react";
import { Container } from "../../components/container";
import { useNavigate, useParams } from "react-router";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConnection";
import { FaWhatsapp } from "react-icons/fa";
import { formatedBrl } from "../../utils/formatedPrice";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";


interface CarProps {
  id: string;
  uid: string;
  name: string;
  city: string;
  year: string;
  model: string;
  km: string;
  price: string;
  description: string;
  created: string;
  owner: string;
  whatsapp: string;
  images: ImagesCarProps[];
}

interface ImagesCarProps {
  uid: string;
  name: string;
  url: string;

}
export function CartDetail() {
  const [car, setCar] = useState<CarProps>();
  const [sliderPerview, setSliderPerview] = useState<number>(2)
  const [showMore, setShowMore] = useState<boolean>(false);
  const navigate = useNavigate()
  const { id } = useParams();

  const MAX_LENGTH = 200;

  function handleToggleDescription() {
    setShowMore(prev => !prev);
  }


  useEffect(() => {

    async function loadCar(){
      if(!id) return;


      const docRef = doc(db, "cars", id)

      getDoc(docRef)
      .then((snapshot) => {

        if(!snapshot.data()) {
          navigate("/")
        }

        setCar({
          id: snapshot.id,
          uid: snapshot.data()?.uid,
          name: snapshot.data()?.name,
          model: snapshot.data()?.model,
          year: snapshot.data()?.year,
          km: snapshot.data()?.km,
          price: snapshot.data()?.price,
          description: snapshot.data()?.description,
          whatsapp: snapshot.data()?.whatsapp,
          city: snapshot.data()?.year,
          owner: snapshot.data()?.owner,
          created: snapshot.data()?.created,
          images: snapshot.data()?.images,
        })
      }).catch((err) => {
        console.log(err)
      })
    }


    loadCar();
  }, [id, navigate])

  useEffect(() => {
    function handleResize(){
      if(window.innerWidth < 720){
        setSliderPerview(1)
      }else {
        setSliderPerview(2)
      }
    }



    handleResize();

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <Container>
      {car && (
        <Swiper
          modules={[Navigation, Pagination, Scrollbar]}
          slidesPerView={sliderPerview}
          pagination={{ clickable: true }}
          navigation
        >
            {car?.images.map(image => (
              <SwiperSlide key={image.name}>
                <img 
                  src={image.url}
                  className="w-full h-96 object-cover"
                />
              </SwiperSlide>
            ))}
        </Swiper>
      )}

      {car && (
        <main className="w-full my-4 p-6 bg-white">
          <div className="flex w-full items-center justify-between">
            <h2 className="font-bold">{car?.name}</h2>
            <h2 className="font-bold">{formatedBrl(car?.price)}</h2>
          </div>
          <p className="mb-10">{car?.model}</p>

          <div className="flex items-center gap-8">
            <div>
              <p>Cidade</p>
              <strong>{car?.city}</strong>
            </div>
            <div>
              <p>Ano</p>
              <strong>{car?.year}</strong>
            </div>
            <div>
              <p>Km</p>
              <strong>{car.km}</strong>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="font-medium">Descrição</h2>
            <p>
              {showMore || (car?.description.length ?? 0) <= MAX_LENGTH
                ? car?.description
                : `${car?.description.substring(0, MAX_LENGTH)}...`}
            </p>

            {car?.description.length > MAX_LENGTH && (
              <button
                onClick={handleToggleDescription}
                className="text-blue-500 mt-2"
              >
                {showMore ? "Ver menos" : "Ver mais"}
              </button>
            )}
          </div>
          <p className="my-5">Telefone: {car?.whatsapp}</p>

          <a 
            href={`https://api.whatsapp.com/send?phone=${car?.whatsapp}&text=Olá vi esse no site webcarro ${car?.name} e fiquei interessado`}
            target="_blank"
            className="w-full bg-green-600 py-2 rounded-sm text-white font-medium cursor-pointer flex justify-center items-center gap-1">
            <FaWhatsapp size={20} color="#fff"/>
            Enviar mensagem whatsapp
          </a>
        </main>
      )}
    </Container>
  )
}