import { useAuthModal } from "../context/AuthModalContext";

const home = () => {
  const { openAuthModal } = useAuthModal();
  return (
    <div className="h-screen flex justify-center items-center">
      <button onClick={openAuthModal} className="bg-violet-400 rounded-xl p-3">
        нажми на меня пж
      </button>
    </div>
  );
};

export default home;
