import LandingPage from './pages/LandingPage';
import StudiosPage from './pages/StudiosPage';
import StudioInfo from './pages/studios/StudioInfo';
import ClassHistory from './pages/accounts/ClassHistory';
import ClassesInfo from './pages/classes/ClassInfo';
import SingleClassInfo from './pages/classes/SingleClassInfo';
import SubscriptionsPage from './pages/SubscriptionsPage';
import NavBar from '../src/components/Navbar';
import Subscribe from './pages/subscriptions/subscribe'
import ChangePayment from './pages/subscriptions/changepayment';
import ChangePlan from './pages/subscriptions/changeplan';
import PaymentHistory from './pages/subscriptions/paymenthistory';
import Signup from './pages/accounts/signup';
import Login from './pages/accounts/login';
import Logout from './pages/accounts/logout';
import ProfileEdit from './pages/accounts/profileedit';
import ManageSubscriptions from './pages/subscriptions/manage_subscriptions';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import SubCancel from './pages/subscriptions/cancel';

function App() {
  window.baseUrl = "http://localhost:7893"
  return (
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/studios" element={<StudiosPage />} />
          <Route path="/studios/:id" element={<StudioInfo />} />
          <Route path="/studios/:id/classes" element={<ClassesInfo />} />
          <Route path="studios/:id/classes/:classid/info" element={<SingleClassInfo />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="subscriptions/subscribe" element={<Subscribe />} />
          <Route path="subscriptions/subcancel" element={<SubCancel />} />
          <Route path="subscriptions/changepayment" element={<ChangePayment />} />
          <Route path="subscriptions/changeplan" element={<ChangePlan />} />
          <Route path="subscriptions/paymenthistory" element={<PaymentHistory />} />
          <Route path="signup" element={<Signup />} />
          <Route path="login" element={<Login />} />
          <Route path="logout" element={<Logout />} />
          <Route path="profile_edit" element={<ProfileEdit />} />
          <Route path="classes" element={<ClassHistory />} />
          <Route path="manage_subscriptions" element={<ManageSubscriptions />} /> 
        </Routes>
      </div>
  );
}

export default App;
