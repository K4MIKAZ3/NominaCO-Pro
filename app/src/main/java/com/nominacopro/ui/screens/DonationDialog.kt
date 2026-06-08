package com.nominacopro.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.nominacopro.R
import com.nominacopro.ui.theme.NominaDesign

@Composable
fun DonationDialog(
    onDismiss: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                stringResource(R.string.donation_dialog_title),
                fontWeight = FontWeight.Bold,
            )
        },
        text = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text(
                    stringResource(R.string.donation_dialog_message),
                    style = MaterialTheme.typography.bodyMedium,
                    color = NominaDesign.TextMuted,
                    textAlign = TextAlign.Center,
                )
                Image(
                    painter = painterResource(R.drawable.donacion_qr),
                    contentDescription = stringResource(R.string.donation_qr_content_description),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp)),
                    contentScale = ContentScale.FillWidth,
                )
                Text(
                    stringResource(R.string.donation_amount_label),
                    fontWeight = FontWeight.SemiBold,
                    color = NominaDesign.Green,
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.donation_dialog_close))
            }
        },
    )
}
