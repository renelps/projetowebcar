import { useContext, useEffect, useState } from "react";
import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelHeader";
import { FiTrash2 } from "react-icons/fi"
import { collection, getDocs, where, query, doc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../../services/firebase/firebaseConnection";
import { AuthContext } from "../../context/authContext";
import { formatedBrl } from "../../utils/formatedPrice";
import { ref, deleteObject } from "firebase/storage"


export interface CarsProps {
  id: string;
  name: string;
  year: string;
  model: string;
  uid: string;
  price: string;
  km: string;
  city: string;
  images: CarImagesProps[];

}

interface CarImagesProps {
  uid: string;
  name: string;
  url: string;
}

export function Dashboard() {
  const [cars, setCars] = useState<CarsProps[]>([])
  const { user } = useContext(AuthContext);

  useEffect(() => {
    function loadCars() {

      if(!user?.uid) return;


      const carsRef = collection(db, "cars")
      const queryRef = query(carsRef, where("uid", "==", user.uid))

      getDocs(queryRef)
      .then((snapshot) => {
        const listCars = [] as CarsProps[];


        snapshot.forEach((doc) => {
          listCars.push({
            id: doc.id,
            name: doc.data().name,
            uid: doc.data().uid,
            model: doc.data().model,
            price: doc.data().price,
            km: doc.data().km,
            city: doc.data().city,
            images: doc.data().images,
            year: doc.data().year
          })

          setCars(listCars)
        })

      }).catch((err) => {
        console.log(err);
      })
    }

    loadCars();
  }, [user])

  async function handleDeleteCar(item: CarsProps) {
    const docRef = doc(db, "cars", item.id)
    
    
    await deleteDoc(docRef)
    item.images.map( async(images) => {
      const imagePath = `images/${images.uid}/${images.name}`
      const imageRef = ref(storage, imagePath)
      console.log("Caminho da imagem:", imagePath);
      try {
        await deleteObject(imageRef)
      }catch(err) {
        console.log(err)
      }
    })

    setCars(cars.filter(car => car.id !== item.id))
  }


  return (
    <Container>
      <DashboardHeader />

      <main className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((item) => (
          <section className="w-full bg-white rounded-md relative" key={item.id}>
            <button 
              onClick={ () => handleDeleteCar(item)}
            className="absolute bg-white w-12 h-12 rounded-full flex items-center justify-center right-2 top-2 cursor-pointer">
              <FiTrash2 size={24} color="#000"/>
            </button>
            <img 
              src={item.images[0].url}
              alt=""
              className="w-full mb-2 max-h-72 object-cover"
            />
            <p>{item.name}</p>

            <div className="flex items-center my-1">
              <span>{item.year} | {item.km} km</span>
            </div>

            <strong className="py-10">{formatedBrl(item.price)}</strong>


            <div className="w-full bg-slate-300 mt-2 h-px"></div>

            <p>{item.city}</p>
          </section>
        ))}
      </main>
    </Container> 
  )
}