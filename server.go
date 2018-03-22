package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/Azure/brigade/pkg/brigade"
	"github.com/Azure/brigade/pkg/storage"
	"github.com/Azure/brigade/pkg/storage/kube"
	"github.com/gin-gonic/gin"
)

var store storage.Store

func main() {
	client, err := kube.GetClient("", os.Getenv("KUBECONFIG"))

	if err != nil {
		panic(err)
	}

	store = kube.New(client, os.Getenv("NAMESPACE"))

	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "OK",
		})
	})

	webhook := router.Group("/webhook")

	webhook.POST("/:org/:repo/:commit", func(c *gin.Context) {
		org := c.Param("org")
		repo := c.Param("repo")
		commit := c.Param("commit")
		projectName := fmt.Sprintf("%s/%s", org, repo)
		project, err := store.GetProject(projectName)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"message": fmt.Sprintf("Brigade project not found for %s", projectName),
			})

			return
		}

		body, err := ioutil.ReadAll(c.Request.Body)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Malformed request body",
			})

			return
		}

		c.Request.Body.Close()

		build := &brigade.Build{
			ProjectID: project.ID,
			Type:      "gcr_image_push",
			Provider:  "google-container-registry",
			Payload:   body,
			Revision: &brigade.Revision{
				Ref: commit,
			},
		}

		if err := store.CreateBuild(build); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Failed to invoke hook",
			})

			return
		}

		// TODO: send build id

		c.JSON(http.StatusOK, gin.H{
			"message": "OK",
			"buildID": build.ID,
		})
	})

	router.Run()
}
