import Joi from "joi";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    productFormDataPath,
    productFormSelector,
} from "../../store/slices/forms";
import {
    imagePathsSelector,
    itemUpdateStatusSelector,
    resetStatus,
    productDataSelector,
    imagePathsStatusSelector,
    requestImagePaths,
    updateProduct,
    deleteProduct,
} from "../../store/slices/items";
import Form from "../commons/form/Form";
import "../../css/product-details/ProductModify.css";
import { backendUrl } from "../../utils/constants";
import {
    marketplaceWallpaper,
    setNewWallpaper,
} from "../../store/slices/wallpaper";

const ProductModify = ({ _id }) => {
    const dispatch = useDispatch();
    const dataPath = productFormDataPath;
    const imagePathsAvailable = useSelector(imagePathsSelector);
    const imagePathsStatus = useSelector(imagePathsStatusSelector);
    const updateStatus = useSelector(itemUpdateStatusSelector);
    const productData = useSelector(productDataSelector);
    const productForm = useSelector(productFormSelector);

    if (imagePathsAvailable.length === 0 && imagePathsStatus === "idle") {
        dispatch(requestImagePaths());
    }

    useEffect(() => {
        dispatch(setNewWallpaper(marketplaceWallpaper));
    }, [dispatch]);

    const schema = useMemo(
        () =>
            Joi.object({
                name: Joi.string()
                    .min(3)
                    .max(255)
                    .regex(/^[\w ]+$/),
                description: Joi.string()
                    .min(3)
                    .max(255)
                    .regex(/^[\w ]+$/),
                stock: Joi.number().integer().min(0).max(1000),
                price: Joi.number().min(0).max(1000).precision(2),
                imagePath: Joi.string().valid(
                    ...imagePathsAvailable.map((image) => image.path)
                ),
            }),
        [imagePathsAvailable]
    );

    const inputs = [
        {
            property: "name",
            type: "text",
            icon: "fas fa-quote-right",
            placeholder: "Product Name",
        },
        {
            property: "description",
            type: "text",
            icon: "fas fa-align-justify",
            placeholder: "Description",
        },
        {
            property: "price",
            type: "text",
            icon: "fas fa-money-bill",
            placeholder: "Price",
        },
        {
            property: "stock",
            type: "text",
            icon: "fas fa-tags",
            placeholder: "Stock",
        },
        {
            property: "imagePath",
            type: "dropdown",
            icon: "fas fa-camera",
            placeholder: "Product Image",
            dropdownOptions: imagePathsAvailable,
        },
        {
            type: "br",
            className: "formSectionBreak",
        },
        [
            {
                type: "button",
                text: "Save",
                className: "blue optionsStacked",
                icon: "fas fa-save",
                style: {
                    fontSize: "1.2rem",
                    borderRadius: "7px",
                    flexGrow: 0.75,
                },
                optionalInside: [
                    {
                        condition: updateStatus === "loading",
                        content: (
                            <i className="fas fa-spinner formButtonLoading" />
                        ),
                    },
                    {
                        condition: updateStatus === "success",
                        content: (
                            <i className="fas fa-check formButtonSuccess" />
                        ),
                    },
                    {
                        condition: updateStatus === "failed",
                        content: <i className="fas fa-times formButtonFail" />,
                    },
                ],
            },
            {
                type: "button",
                text: "Delete",
                className: "red optionsStacked",
                onClick: () => {
                    dispatch(deleteProduct(_id));
                },
                icon: "fas fa-trash",
                style: {
                    flexGrow: 0.25,
                    borderRadius: "7px",
                },
            },
        ],
    ];

    if (updateStatus === "success") {
        setTimeout(() => {
            dispatch(resetStatus());
        }, 2000);
    }

    const doSubmit = () => {
        dispatch(updateProduct({ ...productForm.data, _id }));
    };

    let imagePath = null;
    if (productForm.data.imagePath && !productForm.errors.imagePath) {
        imagePath = productForm.data.imagePath;
    }

    return (
        <div className="productDetails">
            {imagePath ? (
                <img
                    className="productImage"
                    src={backendUrl + imagePath}
                    alt="product representation"
                />
            ) : (
                <div className="productImage">
                    <i className="fas fa-exclamation-circle imageErrorCircle" />
                </div>
            )}

            <Form
                className="productForm"
                inputs={inputs}
                schema={schema}
                dataPath={dataPath}
                doSubmit={doSubmit}
                outsideData={productData.name ? productData : null}
                optionalBefore={<h1 className="authTitle">Product Details</h1>}
                optionalAfter={null}
            />
        </div>
    );
};

export default ProductModify;
