package vn.rentflow;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class RentFlowApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring context initializes, beans wire, and Flyway migrations execute without errors
    }
}
