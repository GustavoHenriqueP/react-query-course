import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchPosts, deletePost, updatePost } from './api';
import { PostDetail } from './PostDetail';
const maxPostPage = 10;

export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (postId) => deletePost(postId),
  });

  const updateMutation = useMutation({
    mutationFn: (postId) => updatePost(postId),
  });

  useEffect(() => {
    if (currentPage >= maxPostPage) return;

    const nextPage = currentPage + 1;

    queryClient.prefetchQuery({
      queryKey: ['posts', nextPage],
      queryFn: () => fetchPosts(nextPage),
      // Interessante adicionar um staleTime para evitar um novo refetch por de baixo dos panos quando
      // o usário estiver percorrendo as páginas e clicar em next em intervalos menores que 5 segundos
      staleTime: 5000,
    });
  }, [currentPage, queryClient]);

  //* Diferença entre isLoaading e isFetching
  // isFetching: A função assíncrona ainda não foi resolvida
  // isLoading: isFetching E não há nenhum cache armazenado
  const { data, isError, error, isLoading } = useQuery({
    queryKey: ['posts', currentPage],
    queryFn: () => fetchPosts(currentPage),
    staleTime: 2000,
  });

  if (isLoading) return <h3>Loading</h3>;

  if (isError)
    return (
      <>
        <h3>Oops, something went wrong</h3>
        <p>{error.toSting()}</p>
      </>
    );

  return (
    <>
      <ul>
        {data.map((post) => (
          <li
            key={post.id}
            className="post-title"
            onClick={() => {
              deleteMutation.reset();
              updateMutation.reset();
              setSelectedPost(post);
            }}
          >
            {post.title}
          </li>
        ))}
      </ul>
      <div className="pages">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((previousValue) => previousValue - 1)}
        >
          Previous page
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage >= maxPostPage}
          onClick={() => setCurrentPage((previousValue) => previousValue + 1)}
        >
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          deleteMutation={deleteMutation}
          updateMutation={updateMutation}
        />
      )}
    </>
  );
}
