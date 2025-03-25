package com.example.recetas

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.recetas.ui.theme.RecetasTheme

data class Category(val name: String,
                    val imageUrl : String,
                    val id: Int)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RecetasTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Home()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Home() {
    val categories = listOf(
        Category("Vegetariano", "https://images.vexels.com/media/users/3/224278/isolated/preview/22f4e4a713fba3ddfcedf96572ad8254-logotipo-de-comida-vegetariana.png", 1),
        Category("Postres", "https://cdn-icons-png.flaticon.com/512/7182/7182828.png",2),
        Category("Sopas", "https://png.pngtree.com/png-clipart/20230913/original/pngtree-soup-clipart-pot-with-soup-illustration-cartoon-vector-png-image_11067461.png", 3),
        Category("Ensaladas", "https://static.vecteezy.com/system/resources/previews/052/325/220/non_2x/plate-of-salad-with-onion-and-tomato-free-png.png", 4),
        Category("Carnes",  "https://images.vexels.com/media/users/3/257686/isolated/preview/31e8ec7bac8a2badc650686ca699697b-comida-de-filete-de-carne-de-vaca.png",5),
        Category("Pescados",  "https://images.vexels.com/media/users/3/192645/isolated/preview/ab48cfdc965b2551198eaa870961c593-peces-destacados-dibujados-a-mano.png",6),
    )

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = {
                Text(text = "Recetas", style = MaterialTheme.typography.titleLarge)
            },
            actions = {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(2.dp),
                    verticalAlignment = Alignment.CenterVertically
                ){
                    IconButton(
                        onClick = { /* TODO: Acción del icono */ }
                    ) {
                        Icon(imageVector = Icons.Filled.AccountCircle, contentDescription = "Search")
                    }

                    IconButton(
                        onClick = { /* TODO: Acción del icono */ }
                    ) {
                        Icon(imageVector = Icons.Filled.Search, contentDescription = "Buscar")
                    }
                }
            }
        )

        Box(
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 16.dp, top = 16.dp, bottom = 0.dp),
                horizontalArrangement = Arrangement.spacedBy(5.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Categorías",
                    style = MaterialTheme.typography.titleLarge,
                )

                IconButton(onClick = { /* TODO: Acción del icono */ }) {
                    Icon(imageVector = Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Ver todas las categorías")
                }
            }
        }

        CategorySlider(categories)

        Spacer(modifier = Modifier.height(16.dp))

        Box(
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 16.dp, top = 16.dp, bottom = 0.dp),
                horizontalArrangement = Arrangement.spacedBy(5.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recetas destacadas",
                    style = MaterialTheme.typography.titleLarge,
                )

                IconButton(onClick = { /* TODO: Acción del icono */ }) {
                    Icon(imageVector = Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Ver todas las recetas")
                }
            }
        }

        ReceipeSlider()
    }
}

@Composable
fun ImageFromUrl(url: String, modifier: Modifier) {
    AsyncImage(
        model = url,
        contentDescription = null,
        modifier = modifier
        //CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
    )
}


@Composable
fun CategorySlider(categories: List<Category>) {
    LazyRow(
        modifier = Modifier
            .padding(
                start = 8.dp,
                end = 8.dp,
            )
            .fillMaxWidth()
            .height(150.dp),
    ) {
        items(categories) { category ->
            CategoryItem(category)
        }
    }
}

@Composable
fun CategoryItem(category: Category) {
    Card(
        modifier = Modifier
            .padding(8.dp)
            .width(120.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            ImageFromUrl(category.imageUrl, Modifier.fillMaxWidth()
                .height(70.dp))
            Text(text = category.name, style = MaterialTheme.typography.bodyMedium)
        }
    }
}

@Composable
fun ReceipeSlider() {
    LazyColumn (
        modifier = Modifier.fillMaxWidth()
    ) {
        items(10) {
            RecipeItem()
        }
    }
}

@Composable
fun RecipeItem() {
    Card(
        modifier = Modifier
            .padding(8.dp)
            .fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .height(IntrinsicSize.Min),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            ImageFromUrl(
                "https://cdn-icons-png.flaticon.com/512/7182/7182828.png",
                Modifier.size(100.dp)
            )

            Column(
                modifier = Modifier
                    .fillMaxHeight()
                    .weight(1f),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column (
                    modifier = Modifier.padding(
                        end = 16.dp
                    )
                ){
                    Text(
                        text = "Receta de postre",
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Postre de chocolate Postre de chocolatePostre de chocolatePostre de chocolatePostre de chocolatePostre de chocolatePostre de chocolatePostre de chocolatePostre de chocolatePostre de chocolatePostre de chocolatePostre de chocolatePostre de chocolatePostre de chocolatePostre de chocolate",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis

                    )

                }

                Spacer(modifier = Modifier.weight(1f))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.AccessTime,
                            contentDescription = "Tiempo de preparación",
                            tint = MaterialTheme.colorScheme.primary
                        )

                        Text(text = "15 min")
                        Text(text = "•")
                        Text(text = "Fácil")
                    }

                    IconButton(onClick = { /* Acción del botón play */ }) {
                        Icon(
                            imageVector = Icons.Filled.PlayArrow,
                            contentDescription = "Ver receta en video",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    RecetasTheme {
        Home()
    }
}

@Preview(showBackground = true)
@Composable
fun CategoryItemPreview() {
    RecetasTheme {
        CategoryItem(Category("Pizza" , "",1))
    }
}

@Preview(showBackground = true)
@Composable
fun CategorySliderPreview() {
    RecetasTheme {
        CategorySlider(
            listOf(
                Category("Vegetariano", "", 1),
                Category("Postres", "",2),
                Category("Sopas", "", 3),
                Category("Ensaladas", "", 4),
                Category("Carnes",  "",5),
                Category("Pescados",  "",6),
            )
        )
    }
}
