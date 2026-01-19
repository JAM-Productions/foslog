import re
from playwright.sync_api import Page, expect


def test_catalan_blog_post_fix(page: Page):
    # Navigate to the blog page
    page.goto("http://localhost:3004/ca/blog")

    # Click on the link for the v0.4.0 blog post
    page.locator('a:has-text("Foslog v0.4.0 - L\'Actualització d\'Expansió")').click()
    page.wait_for_load_state("networkidle")


    # Expect to see the corrected text
    expect(page.locator("text=Gestió de Dades Optimitzada")).to_be_visible()

    # Take a screenshot to verify the fix
    page.screenshot(path="/home/jules/verification/ca-blog-post-final-fix.png")
