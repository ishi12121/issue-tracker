import Pagination from "./components/Pagination";

export default function Home() {
  return (
    <>
       <div>DashBoard</div>
      <Pagination itemCount={100} pageSize={10} currentPage={4} />
     
   </>
   
  )
}
