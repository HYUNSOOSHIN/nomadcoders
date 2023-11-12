import Link from 'next/link';
import { useRouter } from "next/router";
import Layout from '../components/Layout'
import Seo from '../components/Seo'


export default function Index ({results}) {
    const router = useRouter();

    const onClick = (id, title) => {
        router.push(`/movies/${title}/${id}`);
    };

    return (
        <Layout>
            <Seo title="Home"/>
            <div className='container'>
                {results?.map((movie) => <div key={movie.id} onClick={() => onClick(movie.id, movie.original_title)} className="movie">
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt="movie poster" />
                    <h4>
                        <Link href={`/movies/${movie.original_title}/${movie.id}`} legacyBehavior>
                            <a>{movie.original_title}</a>
                        </Link>
                    </h4>
                </div>)}
            </div>

            <style jsx>{`
                .container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    padding: 20px;
                    gap: 20px;
                }
                .movie {
                    cursor: pointer;
                }
                .movie img {
                    max-width: 100%;
                    border-radius: 12px;
                    transition: transform 0.2s ease-in-out;
                    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
                }
                .movie:hover img {
                    transform: scale(1.05) translateY(-10px);
                }
                .movie h4 {
                    font-size: 18px;
                    text-align: center;
                }
            `}</style>
        </Layout>
    )
}

export async function getServerSideProps() {
    const result = await fetch("http://localhost:3000/api/movies")
    const json = await result.json();

    return {
        props: { 
            results: json.results
        }
    }
}