import { useForm, SubmitHandler } from "react-hook-form";

interface IProposalInputs {
  title: string;
  abstract: string;
  file: FileList; 
}

export default function ProposalWizard() {
  const { register, handleSubmit } = useForm<IProposalInputs>();

  const onSubmit: SubmitHandler<IProposalInputs> = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
      <h2 className="text-xl font-bold mb-4">Submit Proposal</h2>

      <input
        {...register("title")}
        placeholder="Judul"
        className="border p-2 w-full mb-3"
      />

      <textarea
        {...register("abstract")}
        placeholder="Abstrak"
        className="border p-2 w-full mb-3"
      />

      <input
        type="file"
        {...register("file")}
        className="mb-4"
      />

      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
}