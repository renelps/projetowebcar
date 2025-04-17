import { Link, useNavigate } from 'react-router';
import logoImg from '../../assets/logo.svg';
import { Input } from '../../components/input';
import { Container } from '../../components/container';
import { useForm } from 'react-hook-form';
import { BsLink } from 'react-icons/bs';
import { z  } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { auth } from "../../services/firebase/firebaseConnection";
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/authContext';
import { Spinner } from '../../components/Spinner';
const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatorio "),
  email: z.string().email("O email tem que ser válido").nonempty("Nao pode deixar o email em branco"),
  password: z.string().min(6, "A senha tem que ter umas quantidade superior a 6 caracteres").nonempty("O campo da senha nao pode ficar em branco")
})

type FormData = z.infer<typeof schema>



export function Register() {

  const [loading, setLoading] = useState(false)
  const [hasLoginError, setHasLoginError] = useState(false)

  const { handleInfoUser } = useContext(AuthContext)

  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }} = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

    useEffect(() => {
      async function handleLogout() {
        await signOut(auth)
      }
  
      handleLogout()
    }, [])

  async function onSubmit(data: FormData) {
    setLoading(true)
    createUserWithEmailAndPassword(auth, data.email, data.password)
    .then(async (user) => {
      await updateProfile((user.user), {
        displayName: data.name
      })

      handleInfoUser({ name: data.name, email: data.email, uid: user.user.uid })
      
      console.log("USUARIO CADASTRADO COM SUCESSO!!")
      navigate("/dashboard", { replace: true })
      setHasLoginError(false)
    }).catch((err) => {
      console.log("OCORREU ALGUM ERRO AO CADASTRAR", err)
      setHasLoginError(true)
    }).finally(() => {
      setLoading(false)
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
                    name="name"
                    placeholder="Digite seu nome"
                    type="text"
                    error={errors.name?.message}
                    register={register}
                  />
                </div>
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

                {hasLoginError && (
                  <p className="text-red-500"> Algo deu errado ao tentar cadastrar. Verifique os dados e tente novamente.</p>
                )}


                <button
                  className="py-2 bg-neutral-900 text-white font-medium rounded-sm cursor-pointer mt-2 flex items-center justify-center gap-2 h-[42px]"
                  disabled={loading}
                >
                  {loading ? <Spinner /> : "Cadastrar"}
                </button>
              </form>

              <div className="flex items-center justify-center relative mt-5">
                <Link 
                  to="/login"
                  className="text-center text-blue-900 font-medium hover:border-b-1 border-blue-900 flex items-center absolute gap-2"
                >
                  Se caso já tenha conta, acesse a página de login <BsLink />
                </Link>
              </div>
        </div>
      </div>
    </Container>
  )
}