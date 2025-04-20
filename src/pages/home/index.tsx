import { useEffect, useState } from "react";
import { Container } from "../../components/container";
import { db } from "../../services/firebase/firebaseConnection"
import { formatedBrl } from "../../utils/formatedPrice"
import { 
  collection,
  getDocs,
  query,
  orderBy,
  where
 } from "firebase/firestore";
import { Link } from "react-router";

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
export function Home() {

  const [cars, setCars] = useState<CarsProps[]>([]);
  const [loadImages, setLoadImages] = useState<string[]>([]);
  const [input, setInput] = useState("")


  useEffect(() => {
    loadCars();
  }, [])

  function loadCars() {
    const carsRef = collection(db, "cars")
    const queryRef = query(carsRef, orderBy("created", "desc"))

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

  async function handleSearchCar(){
    if(input === "") {
      loadCars()
      return;
    }

    setLoadImages([])
    setCars([])

    const q = query(collection(db, "cars"), 
      where("name", ">=", input.toUpperCase()),
      where("name", "<=", input.toUpperCase() + "\uf8ff")
    )

    const querySnapshot = await getDocs(q)

    const listCars = [] as CarsProps[];

    querySnapshot.forEach((doc) => {
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
    })

    setCars(listCars)
  }


  
  function handleImageLoad(id: string) {
    setLoadImages((allImages) => [...allImages, id])
  }



  return (
    <Container>
      <section className="flex items-center justify-center mx-auto bg-white w-full max-w-4xl p-3 rounded-lg">
        <input
          value={input}
          placeholder="Digite o nome do carro"
          onChange={ (e) => setInput(e.target.value)}
          className="w-full p-2 border-1 rounded-sm outline-none placeholder:text-neutral-400"
        />
        <button 
          onClick={handleSearchCar}
          className="bg-red-700 text-white font-bold py-2 px-4 m-1 rounded-sm cursor-pointer"
          >
          Buscar
        </button>

      </section>

      <h2 className="text-center py-2 text-lg text-neutral-400">
        Carros novos e usados
      </h2>

      <main className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cars.map((item) => (
        <Link to={`/detail/${item.id}`} key={item.id}>
          <section className="bg-white rounded-md w-full shadow-md p-4">
            <div 
              className="w-full bg-slate-200 rounded-sm h-72"
              style={{ display: loadImages.includes(item.id) ? "none" : "block"}}
            >

            </div>
            <div className="w-full h-[260px] overflow-hidden rounded-sm bg-slate-200">
              <img
                src={item.images[0].url}
                alt={item.name}
                onLoad={() => handleImageLoad(item.id)}
                style={{ display: loadImages.includes(item.id) ? "block" : "none" }}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="font-medium pt-2 pb-4 text-lg">{item.name}</p>
            <div className="flex flex-col justify-center w-full">
              <p className="font-medium">{formatedBrl(item.price)}</p>
              <span>Ano {item.year} | {item.km} km</span>
            </div>
            <div className="w-full border-1 border-neutral-200 my-2"></div>
            <div className="w-full flex mb-4 pb-2">
              <span>{item.city}</span>
            </div>
          </section>
        </Link>
      ))}

      </main>
    </Container>
  )
}