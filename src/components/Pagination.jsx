import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="pagination">
      {totalPages > 10 ? (
        <>
          <button
            onClick={() => handlePageChange(1)}
            className={currentPage === 1 ? 'active-page' : ''}
            aria-label="Go to first page"
          >
            1
          </button>

          {currentPage > 6 && <span className="ellipsis">...</span>}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page !== 1 &&
                page !== totalPages &&
                page >= currentPage - 4 &&
                page <= currentPage + 4
            )
            .map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={currentPage === page ? 'active-page' : ''}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            ))}

          {currentPage < totalPages - 5 && <span className="ellipsis">...</span>}

          <button
            onClick={() => handlePageChange(totalPages)}
            className={currentPage === totalPages ? 'active-page' : ''}
            aria-label="Go to last page"
          >
            {totalPages}
          </button>
        </>
      ) : (
        Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? 'active-page' : ''}
            aria-label={`Go to page ${index + 1}`}
          >
            {index + 1}
          </button>
        ))
      )}
    </div>
  );
};

export default Pagination;
