import {Helmet} from "react-helmet-async";
import {SEOInterface} from "../_utils/interface";

export default function SEO({title, description, name, keywords, category, classification, image, twitter}: SEOInterface) {
    return <Helmet>
        <title>{title}</title>
        <meta name="description" content={description}></meta>
        <meta name="application-name" content={name}/>
        <meta name="keywords" content={keywords?.join(",")}/>
        <meta name="category" content={category}/>
        <meta name="classification" content={classification}/>
        <meta name="og:image" content={image}/>
        <meta name="twitter:title" content={twitter?.title}/>
        <meta name="twitter:description" content={twitter?.description}/>
        <meta name="twitter:image" content={twitter?.image}/>
    </Helmet>
}