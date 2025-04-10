import { RegisterOptions, UseFormRegister} from 'react-hook-form'

interface InputProps {
  type: string;
  name: string;
  placeholder: string;
  //eslint-disable-next-line
  register: UseFormRegister<any>;
  error?: string;
  rules?: RegisterOptions;
  
}

export function Input( { name, placeholder, type, register, rules, error }: InputProps) {
  return (
    <div>
      <input 
        className="w-full border-2 border-slate-200 outline-none py-2 px-2 rounded-md"
        type={type}
        placeholder={placeholder}
        {...register(name, rules)}
        id={name}
     />

     {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}