import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public class ProductService {

    public List<Product> findProductsByImage(MultipartFile image) {
        // TODO: Logique de similarité d'image
        // Pour le POC, retourne tous les produits actifs
        return productRepository.findByIsActiveTrue();
    }

    public Page<Product> getProductsForListing(Pageable pageable, Long categoryId, Double minPrice, 
                                             Double maxPrice, String condition, String brand, 
                                             String size, String search, String sortBy, String sortOrder) {
        System.out.println("[ProductService] Recherche search = " + search);
        if (search != null && !search.isEmpty()) {
            System.out.println("[ProductService] Utilisation de la recherche textuelle !");
            return productRepository.findByIsActiveAndTitleContainingIgnoreCase(true, search, pageable);
        } else {
            System.out.println("[ProductService] Recherche sans filtre textuel.");
            return productRepository.findByIsActiveTrue(pageable);
        }
    }
} 