package main

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "OK",
		})
	})

	gcr := router.Group("/gcr")

	gcr.POST("/:project", func(c *gin.Context) {
		pid := c.Param("project")

		fmt.Println("pid: ", pid)

		_, err := ioutil.ReadAll(c.Request.Body)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Malformed request body",
			})

			return
		}

		c.Request.Body.Close()

		c.JSON(http.StatusOK, gin.H{
			"message": "OK",
		})
	})

	router.Run()
}
