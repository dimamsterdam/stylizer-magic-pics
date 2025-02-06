import { Link } from "react-router-dom";

interface ProductHeaderProps {
  image: string;
  title: string;
  sku: string;
}

export const ProductHeader = ({ image, title, sku }: ProductHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <img
        src={image}
        alt={title}
        className="w-16 h-16 object-cover rounded-md border border-polaris-border"
      />
      <div className="flex items-center gap-2">
        <div>
          <h1 className="text-display-lg text-polaris-text">{title}</h1>
          <p className="text-body-md text-polaris-secondary">SKU: {sku}</p>
        </div>
        <Link 
          to="/" 
          className="text-sm text-polaris-teal hover:text-polaris-green ml-2"
        >
          change
        </Link>
      </div>
    </div>
  );
};