package com.exploratory;

import java.util.List;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class TestCdiscount  {
    
    final String CHROME_DRIVER_PATH = "C:\\devs\\ET\\ET_DDD\\selenium\\chromedriver.exe";
    final String EXPLORATORY_PLUGIN_PATH = "C:\\devs\\ET\\ET_DDD\\browser-extension\\dist\\chrome";
    final String EXPLORATORY_PLUGIN_ID = "ncfkpkliaaopboelmbgpnngcjcopbffc";
    final String MODEL_ID = "4nCJZhI_g$4ZTqMYpBe";

    @Test
    public void test() {
        // Add AIFEX plugin to webdriver
        System.setProperty("webdriver.chrome.driver", CHROME_DRIVER_PATH);
        ChromeOptions options = new ChromeOptions();
        options.addArguments("load-extension="+EXPLORATORY_PLUGIN_PATH);
        options.addArguments("--start-maximized");
        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setCapability(ChromeOptions.CAPABILITY, options);
        ChromeDriver driver = new ChromeDriver(capabilities);

        // Open AIFEX plugin 
        String popupURL = "chrome-extension://"+EXPLORATORY_PLUGIN_ID+"/popup/popup.html";
        driver.get(popupURL);
        //initialize popup
        WebElement initialize = driver.findElement(By.id("initialize"));
        initialize.click();
        // Load the model
        WebElement modelId = driver.findElement(By.id("connectionCodeInput"));
        modelId.sendKeys(MODEL_ID);
        modelId.submit();
        //Start Exploration
        WebDriverWait wait = new WebDriverWait(driver, 10);
        WebElement start = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("play-button")));
        start.click();

        // Your E2E Test 
        driver.get("https://www.cdiscount.com/");
        //Search Television
        WebElement search = driver.findElement(By.cssSelector(".hSrcInput > input"));
        search.click();
        search.sendKeys("television");
        search.sendKeys("\n");
        //Select first one
        List<WebElement> itemList = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(By.cssSelector("input.btGreen.btS.jsValidForm")));
        itemList.get(0).click();

        // Open AIFEX plugin 
        driver.get(popupURL);
        //Stop Exploration
        WebElement stop = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("stop-button")));
        stop.click();      
        
        //Close the browser
        driver.quit();
    }
}