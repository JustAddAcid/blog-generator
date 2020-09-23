// export default function Custom404() {
//     return <h1>404 - Page Not Found</h1>
//   }
  
import { useRouter } from 'next/router'

function Custom404() {
  const router = useRouter()
  // Make sure we're in the browser
  if (typeof window !== 'undefined') {
    router.push('/404/')
  }
}

export default Custom404