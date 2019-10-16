const api_url = "http://127.0.0.1:3000";
getProducts();
function getProducts() {
    $.ajax({
        url: `${api_url}/product/all`,
        type: 'get',
        contentType: 'application/json',
        success: function(data, textStatus, jqXHR){
            if(data.status === "success"){
                if(jqXHR.status === 200){
                    console.log("data.data",data.data);
                    $('#prodcuts-table').dataTable({
                        data: data.data,
                        destroy: true,
                        columns: [
                            {data: 'name'},
                            {data: 'label'},
                            {data: 'description'},
                            {data: 'rate '},
                            {data: 'sku'}
                        ],
                        responsive: true
                    });
                    $('.no_data_found').hide();
                    $('#prodcuts-table').show();
                }
                else if(jqXHR.status === 204){
                    $('#prodcuts-table').hide();
                    $('.no_data_found').html('<h3 class="m-t-15">No Product Found</h3>');
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log(jqXHR.responseJSON);
            $('#prodcuts-table').hide();
            $('.no_data_found').html('<h3 class="m-t-15">No Product Found</h3>');
            // $(".login_alert_div").empty().hide().addClass('alert-danger').removeClass('alert-success');
            // $(".login_alert_div").text(jqXHR.responseJSON.message).show().fadeTo(5000, 500).slideUp(500);
        }
    });
    return false;
}
$(document).ready(function () {

    $(document).on('click', '.logout-root', function () {
        let cookieName = "inv_cookie";
        // function getCookie(name) {
        //     var nameEQ = name + "=";
        //     var ca = document.cookie.split(';');
        //     for(var i=0;i < ca.length;i++) {
        //         var c = ca[i];
        //         while (c.charAt(0)==' ') c = c.substring(1,c.length);
        //         if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        //     }
        //     return null;
        // }
        // function eraseCookie(cookieName) {
        //     document.cookie = name+'=; Max-Age=-99999999;';
        // }
        document.cookie = cookieName+'=; Max-Age=-99999999;';

        $.ajax({
            url: `${api_url}/user/logout`,
            type: 'GET',
            success: function(data, textStatus, jqXHR){
                if(jqXHR.status == 200){
                    window.location = "login.html";
                }
            },
            error: function(data,bb,cc){
                console.log("Error logging out")
            }
        });

        return false;
    });

    $(document).on('submit', '.add-product-form', function () {
        const name = $('input[name="name"]').val();
        const label = $('input[name="label"]').val();
        const description = $('input[name="description"]').val();
        const rate = $('input[name="rate"]').val();
        const sku = $('input[name="sku"]').val();

        let form_data = {name,label,description,rate,sku};
        form_data = JSON.stringify(form_data);

        $.ajax({
            url: `${api_url}/product/new`,
            type: 'POST',
            contentType :'application/json',
            headers: {
                'Access-Control-Allow-Origin': api_url,
                'Access-Control-Allow-Credentials': 'true'
            },
            data: form_data,
            success: function(data, textStatus, jqXHR){
                if(jqXHR.status == 200){
                    $('.product_alert_div').removeClass('alert-danger').addClass('alert-success');
                    $(".product_alert_div").html("Inserted successfully").show().fadeTo(2000, 500).slideUp(500).hide(0,function () {
                        getProducts();
                    });
                }
                else{
                    $(".product_alert_div").empty().hide().removeClass('alert-success').addClass('alert-danger');
                    $(".product_alert_div").text("Something didn't work").show().fadeTo(2000, 500).slideUp(500);
                }
            },
            error: function(data,bb,cc){
                $(".settings-form-alert").text("Something didn't work").show(0).delay(3000).hide(0);
            }
        });
        return false;
    });

    $(document).on('click', ".add_new_product", function () {
        $('.add-product-form').show();
        $('.remove_new_product').show();
        $('.add_new_product').hide();
    })

    $(document).on('click', ".remove_new_product", function () {
        $('.add-product-form').hide();
        $('.add-product-form').trigger("reset");
        $('.remove_new_product').hide();
        $('.add_new_product').show();
    })
});