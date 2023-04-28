import Header from "@/organisms/Header";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import Main from "@/pages/Main";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.module.css";

// function withRouter(Component: Component) {
//   function ComponentWithRouterProp(props: any) {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const params = useParams();
//     return <Component {...props} router={{ location, navigate, params }} />;
//   }

//   return ComponentWithRouterProp;
// }

// const HeaderWithRouter = withRouter(Header);

function App() {
  return (
    <Router>
      <Header />
      {/* <HeaderWithRouter></HeaderWithRouter> */}
      <Routes>
        <Route path="/about" element={<About></About>} />
        <Route path="/faq" element={<FAQ></FAQ>} />
        <Route path="/contact" element={<Contact></Contact>} />
        <Route path="/" element={<Main></Main>} />
      </Routes>
    </Router>
  );
}

export default App;
