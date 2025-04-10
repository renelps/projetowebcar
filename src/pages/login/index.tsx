import { Link, useNavigate } from 'react-router';
import logoImg from '../../assets/logo.svg';
import { Input } from '../../components/input';
import { Container } from '../../components/container';
import { useForm } from 'react-hook-form';
import { z  } from 'zod';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from "../../services/firebase/firebaseConnection";
import { BsLink } from 'react-icons/bs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

const schema = z.object({
  email: z.string().email("O email tem que ser válido").nonempty("Nao pode deixar o email em branco"),
  password: z.string().nonempty("O campo da senha nao pode ficar em branco")
})

type FormData = z.infer<typeof schema>



export function Login() {

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth)
    }

    handleLogout()
  }, [])



  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }} = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  function onSubmit(data: FormData) {
    signInWithEmailAndPassword(auth, data.email, data.password)
    .then(() => {
      console.log("Logado com sucesso")
      navigate("/dashboard", { replace: true })
    }).catch((err) => {
      console.log("ERROR AO REGISTRAR", err)
    })
  }

  return (
    <Container>
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col max-w-lg w-full">
          <Link to="/" className="flex items-center justify-center mb-4 max-w-[250px] w-full mx-auto">
            <img 
              src={logoImg}
              alt="logoImg"
              className="w-full"
            />

          </Link>

              <form
                className="flex flex-col w-full gap-5 bg-white p-2"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <Input
                    name="email"
                    placeholder="Digite seu email"
                    type="email"
                    error={errors.email?.message}
                    register={register}
                  />
                </div>


                <div>
                  <Input
                  
                    name="password"
                    placeholder="Digite sua senha"
                    type="password"
                    error={errors.password?.message}
                    register={register}
                  />
                </div>


                <button className="py-2 bg-neutral-900 text-white font-medium rounded-sm cursor-pointer mt-2">
                  Acessar
                </button>
              </form>
              <div className="flex items-center justify-center relative mt-5">
                <Link 
                  to="/register"
                  className="text-center text-blue-900 font-medium hover:border-b-1 border-blue-900 flex items-center absolute gap-2"
                >
                  Se caso não tenha conta, acesse a página de cadastro<BsLink />
                </Link>
              </div>
        </div>
      </div>
    </Container>
  )
}