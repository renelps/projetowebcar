import { Container } from "../../components/container";



export function Home() {
  return (
    <Container>
      <section className="flex items-center justify-center mx-auto bg-white w-full max-w-4xl p-3 rounded-lg">
        <input
          placeholder="Digite o nome do carro"
          className="w-full p-2 border-1 rounded-sm outline-none placeholder:text-neutral-400"
        />
        <button className="bg-red-700 text-white font-bold py-2 px-4 m-1 rounded-sm cursor-pointer">
          Buscar
        </button>
      </section>
      <h2 className="text-center py-2 text-lg text-neutral-400">
        Carros novos e usados
      </h2>

      <main className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <section className="bg-white rounded-sm w-full">
          <img src="https://th.bing.com/th/id/R.dc9c3d44ad0cc47ed17a4092c6b035ab?rik=TEp9TQDSMqvlbQ&pid=ImgRaw&r=0" 
            alt="" 
            className="w-full rounded-sm max-h-72 object-contain"
          />

          <p className="text-center font-medium pt-2 pb-4 text-lg">Bmw 320i</p>
          <div className="flex flex-col items-center w-full">
            <strong>R$ 3.000.000</strong>
            <span>Ano 2024/2024 | 23.000 km</span>
          </div>

          <div className="w-full border-1 border-neutral-200 my-2"></div>

          <div className="w-full flex justify-center mb-4">
            <span>Pesqueira - PE</span>
          </div>
        </section>

      </main>
    </Container>
  )
}