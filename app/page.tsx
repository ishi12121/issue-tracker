import Pagination from "./components/Pagination";

export default function Home({
  searchParams,
}: {
    searchParams: { page: string };
}) {
  return (
    <>
       <div>DashBoard</div>
      <Pagination itemCount={100} pageSize={10} currentPage={parseInt(searchParams.page)} />
     
   </>
   
  )
}
