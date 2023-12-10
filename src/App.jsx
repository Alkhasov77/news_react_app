import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  IconButton,
  DialogContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { OpenInNew } from "@mui/icons-material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import DialogActions from "@mui/material/DialogActions";
import AppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import {
  setNewsAction,
  setSelectedSingleNewsAction,
} from "./store/news/actions";
import { useDispatch, useSelector } from "react-redux";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function NewsCard({ article, onClick }) {
  const dispatch = useDispatch();

  return (
    <Card
      sx={{ marginBottom: "20px", display: "flex", flexDirection: "column" }}
      style={{ height: "100%" }}
    >
      {article.urlToImage && (
        <CardMedia
          component="img"
          height="200"
          image={article.urlToImage}
          alt={article.title}
        />
      )}
      <CardContent style={{ flex: "1 0 auto" }}>
        <Typography gutterBottom variant="h5" component="div">
          {article.title}
        </Typography>
        <Typography color="text.secondary">{article.description}</Typography>
      </CardContent>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Link
          to="/single-news"
          onClick={() => dispatch(setSelectedSingleNewsAction(article))}
        >
          <IconButton
            sx={{ color: red[900] }}
            size="small"
          >
            <OpenInNew />
          </IconButton>
        </Link>
        <Button onClick={() => onClick(article)}>Читать больше</Button>
      </div>
    </Card>
  );
}

function Search({ text, setText, sorting, setSorting }) {
  return (
    <Grid container spacing={2}>
      <Grid item md={10}>
        <TextField
          label="Search"
          variant="outlined"
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
          style={{ marginBottom: "20px" }}
        />
      </Grid>
      <Grid item md={2}>
        <FormControl fullWidth>
          <InputLabel id="sorting-label-id">Сортировать</InputLabel>
          <Select
            labelId="sorting-label-id"
            id="sorting-input-id"
            label="Сортировать"
            onChange={(e) => setSorting(e.target.value)}
            value={sorting}
          >
            <MenuItem value="relevancy">Актуальные</MenuItem>
            <MenuItem value="popularity">Популярные</MenuItem>
            <MenuItem value="publishedAt">По дате публикации</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {/* <Grid item md={12}>
        <Accordion>
          <AccordionSummary>
            <Typography>Еще фильтры</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateRangePicker
                localeText={{ start: "Дата публикации с", end: "по" }}
                onChange={(x) => console.log(x[0].format("DD/MM/YYYY"), x[1])}
              />
            </LocalizationProvider>
          </AccordionDetails>
        </Accordion>
      </Grid> */}
    </Grid>
  );
}

const quickFilters = [
  { label: "Политика", color: "primary" },
  { label: "Экономика", color: "secondary" },
  { label: "Майнкрафт", color: "primary" },
];

function wait(ms, data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });
}

function NewsPage() {
  const singleNews = useSelector((state) => state.news.selectedSingleNews);
  const navigate = useNavigate();

  useEffect(() => {
    if (!singleNews) {
      navigate("/");
      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  if (!singleNews) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ padding: "5px 0 0 5px" }}>
        <IconButton onClick={() => navigate("/")}>
          <ArrowBackIcon/>
        </IconButton>
      </div>
      <div style={{ paddingInline: "25%" }}>
        <img src={singleNews.urlToImage} style={{ width: "100%" }} />
      </div>

      <Typography variant="h5">{singleNews.title}</Typography>

      <Typography>{singleNews.description}</Typography>
      <Typography>{singleNews.content}</Typography>

      <Typography style={{ fontSize: "1rem", color: "grey" }}>
        Author: {singleNews.author} (
        {new Date(singleNews.publishedAt).toLocaleString()})
      </Typography>
    </div>
  );
}

function NewsList() {
  const [searchTerm, setSearchTerm] = useState("tesla");
  const [sorting, setSorting] = useState("publishedAt");
  const [selectedNews, setSelectedNews] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const news = useSelector((state) => state.news.allNews);
  const currentNews = news.slice(indexOfFirstItem, indexOfLastItem);

  const dispatch = useDispatch();

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(news.length / itemsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  useEffect(() => {
    setLoadingCategories(true);

    wait(3000, quickFilters).then((categoriesResponse) => {
      setCategories(categoriesResponse);
      setLoadingCategories(false);
    });
  }, []);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    setCurrentPage(1);
    setLoading(true);
    async function fetchNews() {
      try {
        const apiKey = "363b2cd4a73e4f6c80a9755a86013b25";
        let requestUrl = `https://newsapi.org/v2/everything?sortBy=${sorting}&q=${debouncedSearchTerm}&apiKey=${apiKey}`;

        const response = await fetch(requestUrl);
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
          dispatch(setNewsAction(data.articles));
          // setSelectedNews(data.articles[0]);
        } else {
          dispatch(setNewsAction([]));
          setSelectedNews(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        dispatch(setNewsAction([]));
        setSelectedNews(null);
        setLoading(false);
      }
    }
    fetchNews();
  }, [debouncedSearchTerm, sorting]);

  return (
    <div style={{ padding: "20px" }}>
      <Search
        text={searchTerm}
        setText={setSearchTerm}
        sorting={sorting}
        setSorting={setSorting}
      />
      {loadingCategories ? (
        <CircularProgress size="2rem" />
      ) : (
        <Grid container spacing={1} style={{ marginBottom: "15px" }}>
          {categories.map((x) => (
            <Grid item>
              <Chip
                variant="outlined"
                color={x.color}
                label={x.label}
                onClick={() => setSearchTerm(x.label)}
                disabled={searchTerm === x.label}
              />
            </Grid>
          ))}
        </Grid>
      )}
      {loading ? (
        <div>Данные загружаются...</div>
      ) : news.length === 0 ? (
        <div>Нет результатов</div>
      ) : (
        <Grid container spacing={2}>
          {currentNews.map((article, index) => (
            <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
              <NewsCard article={article} onClick={(x) => setSelectedNews(x)} />
            </Grid>
          ))}
        </Grid>
      )}
      {!loading && news.length > itemsPerPage && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {pageNumbers.map((number) => (
            <Button
              key={number}
              variant={currentPage === number ? "contained" : "outlined"}
              onClick={() => handlePageChange(number)}
              style={{
                margin: "5px",
                padding: "5px 10px",
                borderRadius: "5px",
              }}
            >
              {number}
            </Button>
          ))}
        </div>
      )}
      <Dialog
        onClose={() => setSelectedNews(null)}
        open={Boolean(selectedNews)}
      >
        <DialogTitle>
          {selectedNews && selectedNews.title}
          <div>
            {selectedNews && news.indexOf(selectedNews) + 1} из {news.length}
          </div>
        </DialogTitle>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          marginTop={2}
        >
          <img
            height={350}
            width={500}
            src={selectedNews && selectedNews.urlToImage}
            alt={selectedNews && selectedNews.title}
          />
        </Box>
        <DialogContent dividers>
          <Typography gutterBottom>
            {selectedNews && selectedNews.author}
          </Typography>
          <Typography gutterBottom>
            {selectedNews && selectedNews.publishedAt}
          </Typography>
          <Typography gutterBottom>
            {selectedNews && selectedNews.description}
          </Typography>
          <Typography gutterBottom>
            <a
              href={selectedNews && selectedNews.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {selectedNews && selectedNews.url}
            </a>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedNews(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function App() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" component="div">
            News
          </Typography>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<NewsList />} />
        <Route path="/single-news" element={<NewsPage />} />
      </Routes>
    </div>
  );
}

export default App;
