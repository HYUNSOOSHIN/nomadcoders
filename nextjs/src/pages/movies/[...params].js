import { useRouter } from "next/router";
import Layout from '../../components/Layout'
import Seo from '../../components/Seo'

export default function Detail ({params}) {
    const router = useRouter();
    const [title, id] = params || [];

    return (
        <Layout>
            <Seo title={title}/>
            <h4>{title}</h4>
        </Layout>
    )
}

export function getServerSideProps({ params: { params } }) {
    return {
      props: {
        params,
      },
    };
  }