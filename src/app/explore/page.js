import Explore from "../../components/explore";
import { getContentIndex } from "../../lib/content-index";
import "../explore.css";
export const metadata = { title: "探索", description: "沿着主题、系列与旅行足迹，发现更多文章。" };
export default function ExplorePage() { return <Explore index={getContentIndex()} />; }
