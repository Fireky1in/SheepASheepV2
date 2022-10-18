import { useNavigate } from "react-router-dom";

const NavBarBrand = ({ children }) => {
  return (
    <div className="flex self-center items-center text-xl cursor-default h-2/3 px-5">
      {children}
    </div>
  );
};

const NavBarItem = ({ children, onClick }) => {
  return (
    <div
      className="flex self-center items-center text-xl cursor-pointer px-5 h-2/3"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full h-14 divide-x divide-slate-400 bg-slate-500 text-gray-200 rounded-lg">
      <NavBarBrand>羊了个羊羊</NavBarBrand>
      <NavBarItem
        onClick={() => {
          navigate('/')
        }}
      >
        主页
      </NavBarItem>
      <NavBarItem
        onClick={() => {
          navigate('challenge')
        }}
      >
        每日挑战
      </NavBarItem>
      <NavBarItem
        onClick={() => {
          navigate('topic')
        }}
      >
        今日话题
      </NavBarItem>
    </div>
  );
};

export default NavBar;
