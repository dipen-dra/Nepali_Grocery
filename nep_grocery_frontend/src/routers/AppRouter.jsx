
// import React from 'react';
// import { AuthPage } from '../pages/AuthPage';
// import { HomePage } from '../pages/HomePage';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 


// const queryClient = new QueryClient();

// export const AppRouter = () => {
  
//   const route = window.location.hash;

//   let CurrentPage;
//   switch (route) {
//     case '/login':
//     case '/signup':
//       CurrentPage = AuthPage;
//       break;
//     default:
//       CurrentPage = HomePage;
//       break;
//   }
  
//   return (
    
//     <QueryClientProvider client={queryClient}>
//       <CurrentPage />
//       <ToastContainer
//         position="bottom-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="colored"
//       />
//     </QueryClientProvider>
//   );
// };

// export default AppRouter;