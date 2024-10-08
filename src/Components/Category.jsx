import React, { useEffect, useState } from 'react'
import { Button, FloatingLabel, Modal, Form, Row, Col } from 'react-bootstrap';
import { addvideoCategoryAPI, getVideoCategoryAPI, getVideoAPI, updateCategoryAPI, deleteCategoryAPI } from '../../services/allAPI';

import VideoCard from './VideoCard';

function Category(dropVideoResponse) {
  const [categoryName, setCategoryName] = useState("")
  const [allCategories, setAllCategories] = useState([])


  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleAdd = async () => {

    if (categoryName) {
      const result = await addvideoCategoryAPI({ categoryName, allVideos: [] })
      if (result.status >= 200 && result.status < 300) {
        handleClose()
        setCategoryName("")
        getCategories()

      } else {
        alert(result.message)
      }

    } else {
      alert("please fill missing field")
    }
  }

  useEffect(() => {
    getCategories()
  }, [dropVideoResponse])

  const getCategories = async () => {
    const { data } = await getVideoCategoryAPI()
    setAllCategories(data)
  }

  const handleDelete = async (id) => {
    try {
      await deleteCategoryAPI(id);
      getCategories();
    } catch (error) {
      console.error('Error removing category:', error);
    }
  }

  const dragOver = (e) => {
     console.log("Video card drag over the category");
    e.preventDefault()
  }

  const videoDropped = async (e, categoryId) => {
    const videoId = e.dataTransfer.getData("videoId");
    console.log("video id" + videoId, "dropped into the" + categoryId);
    const { data } = await getVideoAPI(videoId);
    //console.log(data);
    const selectedCategory = allCategories.find(item => item.id === categoryId);
  selectedCategory.allVideos.push(data);
    //console.log(selectedCategory);
    await updateCategoryAPI(categoryId, selectedCategory);
  getCategories();



  }
  // console.log(allCategories);
  const videoDragStarted=(e,videoId,categoryId)=>{
    let dataShare = {videoId,categoryId}
    e.dataTransfer.setData("data",JSON.stringify(dataShare))

  }
  


  return (
    <>
      <div className='d-grid'>
        <button onClick={handleShow} className='btn btn-info'>Add Category</button>
      </div>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <FloatingLabel
              controlId="floatingName"
              label="category"
              className="mb-3"
            >
              <Form.Control type="text" placeholder="Enter Category Name" onChange={e => setCategoryName(e.target.value)} />
            </FloatingLabel>


          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdd}>Add</Button>
        </Modal.Footer>
      </Modal>

      {allCategories?.length > 0 ? (
        allCategories.map((category) => (
          <div
            key={category.id}
            className="border rounded p-4 m-3"
            droppable="true"
            onDragOver={(e) => dragOver(e)}
            onDrop={(e) => videoDropped(e, category.id)}
          >
            <div className="d-flex justify-content-between align-items-center">
              <h5>{category.categoryName}</h5>
              <button className=' ' onClick={() => handleDelete(category.id)}>
                <i className='fa-solid fa-trash text-danger'></i>
              </button>
            </div>

            <Row>
              {
                category.allVideos.flat().length > 0 ? category.allVideos.flat().map(card => (
                  <Col sm={12} className='mb=3' draggable onDragStart={e=>videoDragStarted(e,card.id,category.id)} >
                    <VideoCard video={card} insideCategory={true}/>
                  </Col>
                )) : null
              }
            </Row>
          </div>
        ))
      ) : <p>Nothing To Display</p>}

    </>
  )
}

export default Category
